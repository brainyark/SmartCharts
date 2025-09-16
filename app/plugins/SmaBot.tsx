import React from 'react';
import { usePluginContext } from './PluginHost';

function computeSMA(values: number[], period: number) {
    if (values.length < period) return null;
    const sum = values.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
}

export const SmaBot: React.FC = () => {
    const { requestSubscribe, requestForget, registerPanel, unregisterPanel, symbol } = usePluginContext();
    const [enabled, setEnabled] = React.useState<boolean>(() => {
        try {
            return JSON.parse(localStorage.getItem('sma-bot-enabled') || 'false');
        } catch {
            return false;
        }
    });
    const [fastPeriod, setFastPeriod] = React.useState<number>(() => Number(localStorage.getItem('sma-bot-fast') || 9));
    const [slowPeriod, setSlowPeriod] = React.useState<number>(() => Number(localStorage.getItem('sma-bot-slow') || 21));
    const [lastSignal, setLastSignal] = React.useState<string>('');
    const [, setPrices] = React.useState<number[]>([]);
    const panelRef = React.useRef<React.ReactNode | null>(null);

    React.useEffect(() => {
        const panel = (
            <div className='plugin-panel'>
                <h3>SMA Bot</h3>
                <label>
                    <input type='checkbox' checked={enabled} onChange={e => setEnabled(e.target.checked)} /> Enable
                </label>
                <div>
                    <label>Fast SMA
                        <input type='number' min={2} value={fastPeriod} onChange={e => setFastPeriod(Number(e.target.value))} />
                    </label>
                </div>
                <div>
                    <label>Slow SMA
                        <input type='number' min={3} value={slowPeriod} onChange={e => setSlowPeriod(Number(e.target.value))} />
                    </label>
                </div>
                <div>Last signal: {lastSignal || '-'}</div>
            </div>
        );
        panelRef.current = panel;
        registerPanel(panel);
        return () => {
            if (panelRef.current) unregisterPanel(panelRef.current);
        };
    }, [enabled, fastPeriod, slowPeriod, lastSignal, registerPanel, unregisterPanel]);

    React.useEffect(() => {
        localStorage.setItem('sma-bot-enabled', JSON.stringify(enabled));
        localStorage.setItem('sma-bot-fast', String(fastPeriod));
        localStorage.setItem('sma-bot-slow', String(slowPeriod));
    }, [enabled, fastPeriod, slowPeriod]);

    React.useEffect(() => {
        if (!enabled) return;
        const request = { ticks_history: symbol, subscribe: 1 };
        const callback = (msg: any) => {
                if (!msg.tick || typeof msg.tick.quote !== 'number') return;
                setPrices(prev => {
                    const next = [...prev, msg.tick.quote].slice(-Math.max(slowPeriod * 4, 200));
                    const fast = computeSMA(next, fastPeriod);
                    const slow = computeSMA(next, slowPeriod);
                    if (fast && slow) {
                        const prevFast = computeSMA(next.slice(0, -1), fastPeriod);
                        const prevSlow = computeSMA(next.slice(0, -1), slowPeriod);
                        if (prevFast && prevSlow) {
                            if (prevFast <= prevSlow && fast > slow) setLastSignal('BUY');
                            else if (prevFast >= prevSlow && fast < slow) setLastSignal('SELL');
                        }
                    }
                    return next;
                });
            };
        requestSubscribe(request, callback);

        return () => {
            try { requestForget(request, callback); } catch {}
        };
    }, [enabled, fastPeriod, slowPeriod, requestSubscribe, requestForget, symbol]);

    return null;
};

