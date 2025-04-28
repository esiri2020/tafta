export function DashboardHeader({title, description, actions}) {
  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
        {description && (
          <p className='mt-1 text-muted-foreground'>{description}</p>
        )}
      </div>
      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </div>
  );
}
