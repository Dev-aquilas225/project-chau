import { Layout as RaLayout, type LayoutProps } from 'react-admin';
import { AppBar } from './AppBar';
import { Menu } from './Menu';

export function Layout(props: LayoutProps) {
  return <RaLayout {...props} appBar={AppBar} menu={Menu} />;
}
