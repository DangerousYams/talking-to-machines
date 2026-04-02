import re
import json
import sys

def parse_ts_to_json(ts_content):
    # Remove comments
    ts_content = re.sub(r'//.*', '', ts_content)
    ts_content = re.sub(r'/\*.*?\*/', '', ts_content, flags=re.DOTALL)

    # Extract the object literal
    # This regex is more robust to handle cases where 'translations' or 'chX' might not be explicitly typed
    match = re.search(r'(?:const\s+(?:translations|ch\d+)(?::\s*Record<string,\s*Record<string,\s*string>>)?\s*=\s*)?(\{[\s\S]*\});', ts_content)
    if not match:
        return None

    obj_str = match.group(1)

    # Replace single quotes with double quotes for JSON compatibility
    # This is a simplified approach and might fail on complex strings with escaped quotes
    # A more robust solution would involve a proper JavaScript parser, but this should work for the given format.
    # This regex specifically targets single quotes that are not escaped by a backslash.
    obj_str = re.sub(r"(?<!\\)'", '"', obj_str) 

    # Ensure keys are double-quoted. This assumes keys are simple identifiers.
    # It looks for a word character followed by a colon, and wraps the word in double quotes.
    obj_str = re.sub(r'(\w+):', r'"\1":', obj_str)

    # Handle potential trailing commas in objects or arrays (not strictly JSON, but common in JS)
    obj_str = re.sub(r',\s*([}\]])', r'\1', obj_str)

    try:
        return json.loads(obj_str)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}", file=sys.stderr)
        print(f"Problematic string snippet: {obj_str[max(0, e.pos-50):min(len(obj_str), e.pos+50)]}", file=sys.stderr)
        return None

if __name__ == "__main__":
    file_paths = sys.argv[1:]
    
    all_english_translations = {}

    for file_path in file_paths:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            parsed_data = parse_ts_to_json(content)
            if parsed_data:
                # The top-level object in each file is the namespace for that file
                # For example, in ch1.ts, the top-level keys are promptMakeover, guessThePrompt, etc.
                # In breaks.ts, the top-level keys are breakReveal, socraticSmackdown, etc.
                # I need to merge these into a single dictionary.
                all_english_translations.update(parsed_data)
        except FileNotFoundError:
            print(f"Error: File not found at {file_path}", file=sys.stderr)
        except Exception as e:
            print(f"An error occurred while processing {file_path}: {e}", file=sys.stderr)

    json.dump(all_english_translations, sys.stdout, indent=2)
