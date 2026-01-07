import Link from 'next/link';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function SecondaryActions({ showRegister = true }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/login"
          className="text-sm text-primary hover:text-primary/80 transition-fast font-body flex items-center gap-1"
        >
          <Icon name="QuestionMarkCircleIcon" size={16} variant="outline" />
          Forgot Password?
        </Link>
      </div>

      {showRegister && (
        <div className="pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground font-body mb-3">
            Don&apos;t have an account?
          </p>
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-lg border-2 border-border bg-surface text-foreground font-body font-semibold text-sm transition-fast hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-2"
          >
            <Icon name="UserPlusIcon" size={20} variant="outline" />
            Create Account
          </Link>
        </div>
      )}
    </div>
  );
}

SecondaryActions.propTypes = {
  showRegister: PropTypes?.bool
};