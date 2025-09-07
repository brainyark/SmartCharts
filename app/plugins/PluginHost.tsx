import React from 'react';

export type TAPIRequest = (data: any, timeout?: number) => Promise<any>;
export type TAPISubscribe = (request: any, cb: (msg: any) => void) => Promise<void> | void;
export type TAPIForget = (request: any, cb: (msg: any) => void) => void;

export type TPluginContext = {
    requestAPI: TAPIRequest;
    requestSubscribe: TAPISubscribe;
    requestForget: TAPIForget;
    symbol: string;
    registerPanel: (panel: React.ReactNode) => void;
    unregisterPanel: (panel: React.ReactNode) => void;
};

export const PluginContext = React.createContext<TPluginContext | null>(null);

export const usePluginContext = () => {
    const ctx = React.useContext(PluginContext);
    if (!ctx) throw new Error('PluginContext not available');
    return ctx;
};

export const PluginHost: React.FC<{
    requestAPI: TAPIRequest;
    requestSubscribe: TAPISubscribe;
    requestForget: TAPIForget;
    symbol: string;
    children: React.ReactNode;
}> = ({ requestAPI, requestSubscribe, requestForget, symbol, children }) => {
    const [panels, setPanels] = React.useState<React.ReactNode[]>([]);

    const registerPanel = React.useCallback((panel: React.ReactNode) => {
        setPanels(prev => (prev.includes(panel) ? prev : [...prev, panel]));
    }, []);
    const unregisterPanel = React.useCallback((panel: React.ReactNode) => {
        setPanels(prev => prev.filter(p => p !== panel));
    }, []);

    const value = React.useMemo(
        () => ({ requestAPI, requestSubscribe, requestForget, symbol, registerPanel, unregisterPanel }),
        [requestAPI, requestSubscribe, requestForget, symbol, registerPanel, unregisterPanel]
    );

    return (
        <PluginContext.Provider value={value}>
            <div className='sc-with-plugins'>
                <div className='sc-root'>{children}</div>
                {panels.length ? <div className='sc-plugin-panels'>{panels.map((p, i) => (<div key={i}>{p}</div>))}</div> : null}
            </div>
        </PluginContext.Provider>
    );
};

