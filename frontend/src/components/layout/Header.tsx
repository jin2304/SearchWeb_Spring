'use client';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'My Links' }: HeaderProps) {
  return (
    <header className="h-10 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark flex-shrink-0 z-30">
      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <span className="material-symbols-outlined !text-[16px]">home</span> 
        / {title}
      </div>

      <div className="ml-auto flex items-center space-x-2">
        <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <span className="material-symbols-outlined !text-[16px]">notifications</span>
        </button>
        <button 
          type="button"
          className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" 
          onClick={() => document.documentElement.classList.toggle('dark')}
        >
          <span className="material-symbols-outlined !text-[16px]">dark_mode</span>
        </button>
      </div>
    </header>
  );
}
