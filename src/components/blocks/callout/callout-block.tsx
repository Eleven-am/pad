import {
	AlertTriangle,
	Info,
	CheckCircle,
	XCircle,
	Lightbulb,
	Zap,
	AlertCircle,
	FileText,
	Target
} from 'lucide-react';
import {
	Alert,
	AlertDescription,
	AlertTitle
} from '@/components/ui/alert';
import { CalloutData } from '@/services/types';

interface CalloutProps {
	block: CalloutData;
	className?: string;
}

const calloutConfig = {
	WARNING: {
		icon: AlertTriangle,
		variant: 'default' as const,
		className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/20 dark:bg-amber-950/10 dark:text-amber-200',
		defaultTitle: 'WARNING'
	},
	INFO: {
		icon: Info,
		variant: 'default' as const,
		className: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/20 dark:bg-blue-950/10 dark:text-blue-200',
		defaultTitle: 'INFO'
	},
	SUCCESS: {
		icon: CheckCircle,
		variant: 'default' as const,
		className: 'border-green-200 bg-green-50 text-green-900 dark:border-green-900/20 dark:bg-green-950/10 dark:text-green-200',
		defaultTitle: 'SUCCESS'
	},
	ERROR: {
		icon: XCircle,
		variant: 'destructive' as const,
		className: '',
		defaultTitle: 'ERROR'
	},
	TIP: {
		icon: Lightbulb,
		variant: 'default' as const,
		className: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/20 dark:bg-emerald-950/10 dark:text-emerald-200',
		defaultTitle: 'TIP'
	},
	DANGER: {
		icon: Zap,
		variant: 'destructive' as const,
		className: '',
		defaultTitle: 'DANGER'
	},
	NOTE: {
		icon: FileText,
		variant: 'default' as const,
		className: 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200',
		defaultTitle: 'NOTE'
	},
	IMPORTANT: {
		icon: Target,
		variant: 'default' as const,
		className: 'border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900/20 dark:bg-purple-950/10 dark:text-purple-200',
		defaultTitle: 'IMPORTANT'
	},
	CAUTION: {
		icon: AlertCircle,
		variant: 'default' as const,
		className: 'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/20 dark:bg-orange-950/10 dark:text-orange-200',
		defaultTitle: 'CAUTION'
	}
};

export function Callout({
    block,
    className
}: CalloutProps) {
	const { type, title, content } = block;
	const config = calloutConfig[type];
	const Icon = config.icon;
	const displayTitle = title || config.defaultTitle;
	
	return (
		<Alert
			variant={config.variant}
			className={`${config.className} ${className || ''}`}
		>
			<Icon className="h-6 w-6" />
			<AlertTitle className="text-md font-semibold uppercase tracking-wide mb-1">
				{displayTitle}
			</AlertTitle>
			<AlertDescription
				className="text-sm leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0"
				dangerouslySetInnerHTML={{ __html: content }}
			/>
		</Alert>
	);
}
