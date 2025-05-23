import PullToRefresh from './pull-to-refresh.tsx';

interface IPullable {
  children: React.ReactNode;
}

/**
 * Pullable:
 * Basic "pull to refresh" without the refresh.
 * Just visual feedback.
 */
const Pullable: React.FC<IPullable> = ({ children }) =>(
  <PullToRefresh
    // @ts-ignore
    refreshingContent={null}
  >
    {children}
  </PullToRefresh>
);

export default Pullable;
