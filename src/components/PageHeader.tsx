export const PageHeader = ({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle: string;
	children: React.ReactNode;
}) => {
	return (
		<div className="flex items-center justify-between px-5 py-3 border-b">
			<div className="flex flex-col gap-0 items-start justify-center">
				<h1 className="text-2xl font-semibold">{title}</h1>
				<p className="text-muted-foreground">{subtitle}</p>
			</div>
			{children}
		</div>
	);
};
