import { Component } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

// Глобален "предпазител" – хваща грешки при рендериране и показва резервен екран
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI грешка:', error, info);
  }

  componentDidUpdate(prevProps) {
    // При смяна на страницата нулираме грешката
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-400/15 text-rose-300">
          <FaExclamationTriangle size={26} />
        </div>
        <h1 className="text-2xl font-bold text-white">Нещо се обърка</h1>
        <p className="text-slate-400">
          Възникна неочаквана грешка при показването на тази страница. Опитайте да презаредите.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Презареди
          </button>
          <a href="/" className="rounded-2xl border border-white/10 px-5 py-3 font-medium text-slate-100 transition hover:bg-white/10">
            Към началото
          </a>
        </div>
      </div>
    );
  }
}
