import { PageContainerProps } from '../types';

export default function PageContainer({ children, id }: PageContainerProps) {
  return (
    <div
      id={id || 'page-content-container'}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none"
    >
      {children}
    </div>
  );
}
