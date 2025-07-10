import { VideoPlayer } from "@/app/components/VideoPlayer";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Custom Canvas Video Player</h1>
      <VideoPlayer videoUrl="http://localhost:3001/video" />
    </div>
  );
}
