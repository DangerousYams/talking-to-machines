import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface PageViewsChartProps {
  data: { date: string; count: number; scroll: number; cards: number }[];
}

export default function PageViewsChart({ data }: PageViewsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    date: string;
    scroll: number;
    cards: number;
  }>({ visible: false, x: 0, y: 0, date: '', scroll: 0, cards: 0 });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, innerWidth])
      .padding(0.3);

    const maxVal = d3.max(data, (d) => d.scroll + d.cards) || 0;
    const y = d3.scaleLinear().domain([0, maxVal * 1.1]).range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#374151')
      .attr('stroke-dasharray', '2,2');

    // Stacked bars - scroll portion (bottom)
    g.selectAll('.bar-scroll')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-scroll')
      .attr('x', (d) => x(d.date)!)
      .attr('y', (d) => y(d.scroll + d.cards))
      .attr('width', x.bandwidth())
      .attr('height', (d) => innerHeight - y(d.scroll))
      .attr('fill', '#0EA5E9')
      .attr('rx', 3)
      .attr('ry', 3)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          date: d.date,
          scroll: d.scroll,
          cards: d.cards,
        });
      })
      .on('mouseleave', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Stacked bars - cards portion (top)
    g.selectAll('.bar-cards')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-cards')
      .attr('x', (d) => x(d.date)!)
      .attr('y', (d) => y(d.scroll + d.cards))
      .attr('width', x.bandwidth())
      .attr('height', (d) => innerHeight - y(d.cards))
      .attr('fill', '#E94560')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('transform', (d) => `translate(0, 0)`)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          date: d.date,
          scroll: d.scroll,
          cards: d.cards,
        });
      })
      .on('mouseleave', () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Re-position stacked bars correctly:
    // Bottom bar (scroll): from y(scroll) to bottom
    // Top bar (cards): from y(scroll + cards) to y(scroll)
    g.selectAll('.bar-scroll')
      .attr('y', (d: any) => y(d.scroll))
      .attr('height', (d: any) => innerHeight - y(d.scroll));

    g.selectAll('.bar-cards')
      .attr('y', (d: any) => y(d.scroll + d.cards))
      .attr('height', (d: any) => y(d.scroll) - y(d.scroll + d.cards));

    // X Axis
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => formatDate(d as string))
          .tickSize(0)
      )
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    g.select('.domain').attr('stroke', '#374151');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '11px');

    g.selectAll('.domain').attr('stroke', '#374151');

    // Resize observer
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        const newWidth = containerRef.current.getBoundingClientRect().width;
        svg.attr('width', newWidth);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: '#1e2240',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.95rem',
        }}
      >
        No data yet
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        background: '#1e2240',
        borderRadius: '12px',
        padding: '24px',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600, margin: 0 }}>
          Daily Page Views
        </h3>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                background: '#0EA5E9',
                display: 'inline-block',
              }}
            />
            Scroll
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                background: '#E94560',
                display: 'inline-block',
              }}
            />
            Cards
          </span>
        </div>
      </div>
      <svg ref={svgRef} />
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: '#0f1629',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#ffffff',
            fontSize: '0.8rem',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {new Date(tooltip.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          <div style={{ color: '#0EA5E9' }}>Scroll: {tooltip.scroll}</div>
          <div style={{ color: '#E94560' }}>Cards: {tooltip.cards}</div>
          <div style={{ color: '#9ca3af', marginTop: '2px' }}>
            Total: {tooltip.scroll + tooltip.cards}
          </div>
        </div>
      )}
    </div>
  );
}
