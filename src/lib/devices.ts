import { supabase } from './supabase';

export interface ActiveDevice {
  id: string;
  device_name: string;
  last_seen_at: string;
  created_at: string;
  token_uid: string;
}

/**
 * Parse a user-agent string into a human-readable device name.
 */
export function parseDeviceName(ua: string): string {
  if (!ua) return 'Unknown device';

  let browser = 'Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome') && !ua.includes('Edg/')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

  let os = '';
  if (ua.includes('iPhone') || ua.includes('iPad')) os = ua.includes('iPad') ? 'iPad' : 'iPhone';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Linux')) os = 'Linux';

  return os ? `${browser} on ${os}` : browser;
}

/**
 * Register a device. Returns ok: false with device list if at the 5-device limit.
 */
export async function registerDevice(
  cid: string,
  email: string,
  tokenUid: string,
  ua: string,
): Promise<{ ok: boolean; devices?: ActiveDevice[]; error?: string }> {
  if (!supabase) return { ok: true };

  const deviceName = parseDeviceName(ua);

  // Count active tokens for this customer
  const { data: existing, error: countErr } = await supabase
    .from('active_tokens')
    .select('id, device_name, last_seen_at, created_at, token_uid')
    .eq('cid', cid);

  if (countErr) {
    console.error('Device count failed:', countErr);
    return { ok: true }; // Fail open
  }

  if (existing && existing.length >= 5) {
    return {
      ok: false,
      devices: existing as ActiveDevice[],
      error: 'device_limit',
    };
  }

  // Upsert device
  const { error: upsertErr } = await supabase
    .from('active_tokens')
    .upsert(
      {
        cid,
        customer_email: email,
        token_uid: tokenUid,
        device_name: deviceName,
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: 'token_uid' },
    );

  if (upsertErr) {
    console.error('Device register failed:', upsertErr);
  }

  return { ok: true };
}

/**
 * Get all active devices for a customer.
 */
export async function getActiveDevices(cid: string): Promise<ActiveDevice[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('active_tokens')
    .select('id, device_name, last_seen_at, created_at, token_uid')
    .eq('cid', cid)
    .order('last_seen_at', { ascending: false });

  if (error) {
    console.error('Get devices failed:', error);
    return [];
  }

  return (data as ActiveDevice[]) || [];
}

/**
 * Remove a device by its row ID. Returns true if deleted.
 */
export async function removeDevice(cid: string, deviceId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('active_tokens')
    .delete()
    .eq('id', deviceId)
    .eq('cid', cid); // Ensure ownership

  return !error;
}

/**
 * Update the last_seen_at timestamp for a device. Fire-and-forget.
 */
export async function touchDevice(tokenUid: string): Promise<void> {
  if (!supabase) return;

  await supabase
    .from('active_tokens')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('token_uid', tokenUid);
}
