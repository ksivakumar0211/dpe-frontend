import  { lazy, ReactNode, LazyExoticComponent, ComponentType } from 'react';

interface BaseNavItem {
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  url: string;
  icon?: ReactNode;
  badge?: {
    color: string;
    text: string;
  };
}

interface NavGroup extends BaseNavItem {
  items: BaseNavItem[];
}
type NavItem = BaseNavItem | NavGroup;



const routes: NavItem[] = [
  { url: '/editDocUpload', component: lazy(() => import('@/pages/agents/application/document/Search')), },
  { url: '/addDocUpload', component: lazy(() => import('@/pages/agents/application/document/Add')), },
  { url: '/viewDocUpload', component: lazy(() => import('@/pages/containerOperation/transactions/documentView/Search')), },

  { url: '/addDpeServiceCharge', component: lazy(() => import('@/pages/containerOperation/transactions/directPortSvcCharge/Add')), },
  { url: '/editDpeServiceCharge', component: lazy(() => import('@/pages/containerOperation/transactions/directPortSvcCharge/Search')), },
  { url: '/addGateOut', component: lazy(() => import('@/pages/containerOperation/transactions/getOutContainer/Add')), },
  { url: '/editGateOut', component: lazy(() => import('@/pages/containerOperation/transactions/getOutContainer/Search')), },
  { url: '/addGateIn', component: lazy(() => import('@/pages/containerOperation/transactions/gainInContainer/Add')), },
  { url: '/editGateIn', component: lazy(() => import('@/pages/containerOperation/transactions/gainInContainer/Search')), },
  { url: '/addUserAccess', component: lazy(() => import('@/pages/security/transactions/userAccess/Add')), },
  { url: '/editUserAccess', component: lazy(() => import('@/pages/security/transactions/userAccess/Edit')), },

  { url: '/dashboard', component: lazy(() => import('@/pages/Dashboard')) },
];

export default routes;
