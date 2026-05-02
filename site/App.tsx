import { App as AntApp, ConfigProvider, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { useEffect } from 'react';
import 'antd/dist/reset.css';
import PrintDesigner from '@/components/PrintDesigner';
import PrintRenderer from '@/components/print/PrintRenderer';
import { getInitialLanguage } from '@/locales';
import { DesignerProvider } from '@/state/designer';
import '@/style.css';

const isPrintRenderer =
  new URLSearchParams(window.location.search).get('print') === '1' || window.location.pathname.endsWith('/print');

export const App = () => {
  const locale = getInitialLanguage();

  useEffect(() => {
    document.title = 'React Print Designer';
  }, []);

  return (
    <ConfigProvider
      locale={locale === 'zh' ? zhCN : enUS}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        components: {
          Layout: { headerBg: '#ffffff', bodyBg: '#f5f7fb' },
          Card: { borderRadiusLG: 6 },
        },
      }}
    >
      <AntApp>
        {isPrintRenderer ? (
          <PrintRenderer />
        ) : (
          <DesignerProvider>
            <PrintDesigner locale={locale} />
          </DesignerProvider>
        )}
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
