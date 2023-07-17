export default function TopProduct(props: {
  message: string;
  media: React.ReactNode;
}) {
  const { media, message } = props;
  return (
    <div className="topProduct">
      <div>{message}</div>
      <div>{media}</div>
    </div>
  );
}
