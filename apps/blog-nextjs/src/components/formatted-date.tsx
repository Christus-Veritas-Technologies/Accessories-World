interface FormattedDateProps {
  date: Date;
}

export function FormattedDate({ date }: FormattedDateProps) {
  return (
    <time dateTime={date.toISOString()}>
      {date.toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}
    </time>
  );
}
