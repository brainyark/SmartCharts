import React from 'react';
import ReactDOM from 'react-dom';
import {
    SmartChart,
    ChartMode,
    ChartSetting,
    ChartTitle,
    DrawTools,
    Share,
    StudyLegend,
    ToolbarWidget,
    Views,
    setSmartChartsPublicPath,
} from '@deriv-com/smartcharts';
import { ConnectionManager, StreamManager } from './connection';
import './app.scss';
import { PluginHost } from './plugins/PluginHost';
import { SmaBot } from './plugins/SmaBot';

setSmartChartsPublicPath('./dist/');

const isMobile = window.navigator.userAgent.toLowerCase().includes('mobi');

function getLanguageStorage() {
    const default_language = 'en';
    try {
        const setting_string = localStorage.getItem('smartchart-setting') || '',
            setting = JSON.parse(setting_string !== '' ? setting_string : '{}');
        return setting.language || default_language;
    } catch (e) {
        return default_language;
    }
}
function getServerUrl() {
    const local = localStorage.getItem('config.server_url');
    return `wss://${local || 'red.derivws.com'}/websockets/v3`;
}

const appId = localStorage.getItem('config.app_id') || 12812;
const serverUrl = getServerUrl();
const language = new URLSearchParams(window.location.search).get('l') || getLanguageStorage();

const connectionManager = new ConnectionManager({ appId, endpoint: serverUrl, language });
const streamManager = new StreamManager(connectionManager);

const requestAPI = connectionManager.send.bind(connectionManager);
const requestSubscribe = streamManager.subscribe.bind(streamManager);
const requestForget = streamManager.forget.bind(streamManager);

const DollarApp = () => {
    const [symbol, setSymbol] = React.useState('R_50');
    const [granularity, setGranularity] = React.useState<number | undefined>(60);
    const [chartType, setChartType] = React.useState<string | undefined>('candles');
    // No historical marker for this entry; keep UI simple
    const [isConnectionOpened, setIsConnectionOpened] = React.useState(true);

    React.useEffect(() => {
        connectionManager.on(ConnectionManager.EVENT_CONNECTION_CLOSE, () => setIsConnectionOpened(false));
        connectionManager.on(ConnectionManager.EVENT_CONNECTION_REOPEN, () => setIsConnectionOpened(true));
    }, []);

    const renderTopWidgets = React.useCallback(() => (
        <React.Fragment>
            <ChartTitle onChange={setSymbol} isNestedList={isMobile} />
        </React.Fragment>
    ), []);

    const renderToolbarWidget = React.useCallback(() => {
        const changeGranularity = (g: any) => setGranularity(g);
        const changeChartType = (t?: string) => setChartType(t);
        return (
            <ToolbarWidget>
                <ChartMode onChartType={changeChartType} onGranularity={changeGranularity} />
                <StudyLegend />
                <Views onChartType={changeChartType} onGranularity={changeGranularity} />
                <DrawTools />
                <Share />
            </ToolbarWidget>
        );
    }, []);

    return (
        <PluginHost
            requestAPI={requestAPI}
            requestSubscribe={requestSubscribe}
            requestForget={requestForget}
            symbol={symbol}
        >
            <SmaBot />
            <SmartChart
                id='dollar'
                isMobile={isMobile}
                symbol={symbol}
                chartType={chartType}
                granularity={granularity as any}
                topWidgets={renderTopWidgets}
                toolbarWidget={renderToolbarWidget}
                chartControlsWidgets={() => <ChartSetting />}
                requestAPI={requestAPI}
                requestSubscribe={requestSubscribe}
                requestForget={requestForget}
                isLive
                isConnectionOpened={isConnectionOpened}
                shouldFetchTradingTimes
                shouldFetchTickHistory
            />
        </PluginHost>
    );
};

ReactDOM.render(<DollarApp />, document.getElementById('root'));

