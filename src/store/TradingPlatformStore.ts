import { observable, action, makeObservable, computed } from 'mobx';
import { TMainStore } from '../types';

export interface TradingAccount {
    id: string;
    name: string;
    balance: number;
    currency: string;
    type: 'demo' | 'live';
    connected: boolean;
}

export interface Position {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    size: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
    timestamp: number;
    stopLoss?: number;
    takeProfit?: number;
}

export interface Order {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    size: number;
    price?: number;
    stopPrice?: number;
    status: 'pending' | 'filled' | 'cancelled' | 'rejected';
    timestamp: number;
    fillPrice?: number;
    fillTime?: number;
}

export interface TradingBot {
    id: string;
    name: string;
    strategy: string;
    status: 'running' | 'stopped' | 'paused';
    symbol: string;
    profit: number;
    profitPercent: number;
    trades: number;
    winRate: number;
    createdAt: number;
    lastActivity: number;
    settings: Record<string, any>;
}

export default class TradingPlatformStore {
    mainStore: TMainStore;
    
    // Trading Account Management
    accounts: TradingAccount[] = [];
    selectedAccount: TradingAccount | null = null;
    
    // Portfolio & Positions
    positions: Position[] = [];
    orders: Order[] = [];
    totalBalance: number = 0;
    totalPnL: number = 0;
    totalPnLPercent: number = 0;
    
    // Trading Bots
    tradingBots: TradingBot[] = [];
    botStrategies: string[] = [
        'Grid Trading',
        'DCA (Dollar Cost Average)',
        'Scalping',
        'Trend Following',
        'Mean Reversion',
        'Arbitrage',
        'Market Making',
        'Breakout Trading'
    ];
    
    // UI State
    showTradingPanel: boolean = false;
    showBotManager: boolean = false;
    showPortfolio: boolean = false;
    selectedTab: 'trading' | 'bots' | 'portfolio' | 'analytics' = 'trading';
    
    // Real-time data
    marketData: Record<string, any> = {};
    isConnected: boolean = false;
    
    constructor(mainStore: TMainStore) {
        this.mainStore = mainStore;
        makeObservable(this, {
            accounts: observable,
            selectedAccount: observable,
            positions: observable,
            orders: observable,
            totalBalance: observable,
            totalPnL: observable,
            totalPnLPercent: observable,
            tradingBots: observable,
            showTradingPanel: observable,
            showBotManager: observable,
            showPortfolio: observable,
            selectedTab: observable,
            marketData: observable,
            isConnected: observable,
            
            // Actions
            setShowTradingPanel: action,
            setShowBotManager: action,
            setShowPortfolio: action,
            setSelectedTab: action,
            addAccount: action,
            selectAccount: action,
            addPosition: action,
            updatePosition: action,
            removePosition: action,
            addOrder: action,
            updateOrder: action,
            cancelOrder: action,
            addBot: action,
            updateBot: action,
            deleteBot: action,
            startBot: action,
            stopBot: action,
            updateMarketData: action,
            setConnectionStatus: action,
            
            // Computed
            activePositions: computed,
            openOrders: computed,
            runningBots: computed,
            portfolioValue: computed,
        });
        
        this.initializeDemo();
    }
    
    // UI Actions
    setShowTradingPanel = (show: boolean) => {
        this.showTradingPanel = show;
    };
    
    setShowBotManager = (show: boolean) => {
        this.showBotManager = show;
    };
    
    setShowPortfolio = (show: boolean) => {
        this.showPortfolio = show;
    };
    
    setSelectedTab = (tab: 'trading' | 'bots' | 'portfolio' | 'analytics') => {
        this.selectedTab = tab;
    };
    
    // Account Management
    addAccount = (account: TradingAccount) => {
        this.accounts.push(account);
        if (!this.selectedAccount) {
            this.selectedAccount = account;
        }
    };
    
    selectAccount = (accountId: string) => {
        const account = this.accounts.find(acc => acc.id === accountId);
        if (account) {
            this.selectedAccount = account;
        }
    };
    
    // Position Management
    addPosition = (position: Position) => {
        this.positions.push(position);
        this.calculateTotals();
    };
    
    updatePosition = (positionId: string, updates: Partial<Position>) => {
        const index = this.positions.findIndex(pos => pos.id === positionId);
        if (index !== -1) {
            Object.assign(this.positions[index], updates);
            this.calculateTotals();
        }
    };
    
    removePosition = (positionId: string) => {
        this.positions = this.positions.filter(pos => pos.id !== positionId);
        this.calculateTotals();
    };
    
    // Order Management
    addOrder = (order: Order) => {
        this.orders.push(order);
    };
    
    updateOrder = (orderId: string, updates: Partial<Order>) => {
        const index = this.orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
            Object.assign(this.orders[index], updates);
        }
    };
    
    cancelOrder = (orderId: string) => {
        this.updateOrder(orderId, { status: 'cancelled' });
    };
    
    // Bot Management
    addBot = (bot: TradingBot) => {
        this.tradingBots.push(bot);
    };
    
    updateBot = (botId: string, updates: Partial<TradingBot>) => {
        const index = this.tradingBots.findIndex(bot => bot.id === botId);
        if (index !== -1) {
            Object.assign(this.tradingBots[index], updates);
        }
    };
    
    deleteBot = (botId: string) => {
        this.tradingBots = this.tradingBots.filter(bot => bot.id !== botId);
    };
    
    startBot = (botId: string) => {
        this.updateBot(botId, { status: 'running', lastActivity: Date.now() });
    };
    
    stopBot = (botId: string) => {
        this.updateBot(botId, { status: 'stopped' });
    };
    
    // Market Data
    updateMarketData = (symbol: string, data: any) => {
        this.marketData[symbol] = data;
        
        // Update positions with current prices
        this.positions.forEach(position => {
            if (position.symbol === symbol && data.price) {
                position.currentPrice = data.price;
                position.pnl = (position.currentPrice - position.entryPrice) * position.size * (position.side === 'buy' ? 1 : -1);
                position.pnlPercent = (position.pnl / (position.entryPrice * position.size)) * 100;
            }
        });
        
        this.calculateTotals();
    };
    
    setConnectionStatus = (connected: boolean) => {
        this.isConnected = connected;
    };
    
    // Computed Properties
    get activePositions() {
        return this.positions.filter(pos => pos.size > 0);
    }
    
    get openOrders() {
        return this.orders.filter(order => order.status === 'pending');
    }
    
    get runningBots() {
        return this.tradingBots.filter(bot => bot.status === 'running');
    }
    
    get portfolioValue() {
        const positionValue = this.positions.reduce((total, pos) => total + (pos.currentPrice * pos.size), 0);
        const cash = this.selectedAccount?.balance || 0;
        return positionValue + cash;
    }
    
    // Private Methods
    private calculateTotals = () => {
        this.totalPnL = this.positions.reduce((total, pos) => total + pos.pnl, 0);
        const totalInvested = this.positions.reduce((total, pos) => total + (pos.entryPrice * pos.size), 0);
        this.totalPnLPercent = totalInvested > 0 ? (this.totalPnL / totalInvested) * 100 : 0;
        this.totalBalance = (this.selectedAccount?.balance || 0) + this.totalPnL;
    };
    
    private initializeDemo = () => {
        // Add demo account
        this.addAccount({
            id: 'demo-1',
            name: 'Demo Account',
            balance: 10000,
            currency: 'USD',
            type: 'demo',
            connected: true
        });
        
        // Add sample positions
        this.addPosition({
            id: 'pos-1',
            symbol: 'EURUSD',
            side: 'buy',
            size: 1000,
            entryPrice: 1.0850,
            currentPrice: 1.0875,
            pnl: 25,
            pnlPercent: 2.3,
            timestamp: Date.now() - 3600000,
            stopLoss: 1.0800,
            takeProfit: 1.0950
        });
        
        this.addPosition({
            id: 'pos-2',
            symbol: 'GBPUSD',
            side: 'sell',
            size: 500,
            entryPrice: 1.2650,
            currentPrice: 1.2635,
            pnl: 7.5,
            pnlPercent: 1.2,
            timestamp: Date.now() - 1800000,
        });
        
        // Add sample orders
        this.addOrder({
            id: 'order-1',
            symbol: 'USDJPY',
            side: 'buy',
            type: 'limit',
            size: 1000,
            price: 150.50,
            status: 'pending',
            timestamp: Date.now() - 300000
        });
        
        // Add sample bots
        this.addBot({
            id: 'bot-1',
            name: 'EUR/USD Grid Bot',
            strategy: 'Grid Trading',
            status: 'running',
            symbol: 'EURUSD',
            profit: 156.75,
            profitPercent: 15.67,
            trades: 24,
            winRate: 75,
            createdAt: Date.now() - 86400000 * 7,
            lastActivity: Date.now() - 300000,
            settings: {
                gridSpacing: 0.001,
                gridLevels: 10,
                positionSize: 100
            }
        });
        
        this.addBot({
            id: 'bot-2',
            name: 'BTC Scalper',
            strategy: 'Scalping',
            status: 'stopped',
            symbol: 'BTCUSD',
            profit: -23.45,
            profitPercent: -2.34,
            trades: 18,
            winRate: 61,
            createdAt: Date.now() - 86400000 * 3,
            lastActivity: Date.now() - 3600000,
            settings: {
                timeframe: '1m',
                rsiPeriod: 14,
                rsiOverbought: 70,
                rsiOversold: 30
            }
        });
        
        this.calculateTotals();
    };
    
    // Trading Actions (these would integrate with real broker APIs)
    placeOrder = async (orderData: Omit<Order, 'id' | 'timestamp' | 'status'>) => {
        const order: Order = {
            ...orderData,
            id: `order-${Date.now()}`,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        this.addOrder(order);
        
        // Simulate order processing
        setTimeout(() => {
            if (order.type === 'market') {
                this.updateOrder(order.id, { 
                    status: 'filled', 
                    fillPrice: orderData.price || 0, 
                    fillTime: Date.now() 
                });
                
                // Create position
                const position: Position = {
                    id: `pos-${Date.now()}`,
                    symbol: order.symbol,
                    side: order.side,
                    size: order.size,
                    entryPrice: order.fillPrice || order.price || 0,
                    currentPrice: order.fillPrice || order.price || 0,
                    pnl: 0,
                    pnlPercent: 0,
                    timestamp: Date.now()
                };
                
                this.addPosition(position);
            }
        }, 1000 + Math.random() * 2000);
        
        return order;
    };
    
    closePosition = async (positionId: string) => {
        const position = this.positions.find(pos => pos.id === positionId);
        if (position) {
            // Create closing order
            await this.placeOrder({
                symbol: position.symbol,
                side: position.side === 'buy' ? 'sell' : 'buy',
                type: 'market',
                size: position.size,
                price: position.currentPrice
            });
            
            // Remove position
            setTimeout(() => {
                this.positions = this.positions.filter(pos => pos.id !== positionId);
                this.calculateTotals();
            }, 1500);
        }
    };
}