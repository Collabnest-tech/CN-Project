export default function VideoPlayer({ src }) {
  return (
    <video controls className="w-full rounded">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}