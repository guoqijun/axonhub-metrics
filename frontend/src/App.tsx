import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AppRouter from './router'

const themeConfig = {
  token: {
    colorPrimary: '#6366f1',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#6366f1',
    colorBgLayout: '#f1f5f9',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorText: '#1e293b',
    colorTextSecondary: '#64748b',
    colorTextTertiary: '#94a3b8',
    colorBorderSecondary: '#e2e8f0',
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    wireframe: false,
    controlHeight: 36,
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 56,
      siderBg: '#0f172a',
      bodyBg: '#f1f5f9',
    },
    Menu: {
      darkItemBg: '#0f172a',
      darkItemColor: 'rgba(255,255,255,0.65)',
      darkItemSelectedBg: 'rgba(99,102,241,0.15)',
      darkItemSelectedColor: '#fff',
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
      itemHeight: 44,
      itemMarginInline: 8,
      itemBorderRadius: 6,
    },
    Card: {
      paddingLG: 20,
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#64748b',
      headerBorderRadius: 8,
      rowHoverBg: '#f1f5f9',
      borderColor: '#f1f5f9',
    },
    Segmented: {
      itemSelectedBg: '#ffffff',
      itemSelectedColor: '#6366f1',
    },
    Button: {
      primaryShadow: '0 1px 2px 0 rgba(99,102,241,0.3)',
    },
    Tag: {
      borderRadius: 6,
    },
    Tooltip: {
      borderRadius: 6,
    },
    Alert: {
      borderRadiusLG: 8,
    },
  },
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
