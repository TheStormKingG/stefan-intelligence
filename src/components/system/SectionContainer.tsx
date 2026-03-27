interface SectionContainerProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionContainer({
  title,
  subtitle,
  action,
  children,
  className = "",
}: SectionContainerProps) {
  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
