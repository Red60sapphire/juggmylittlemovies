import WatchPartyRoom from "@/components/WatchPartyRoom";

export default async function WatchPartyRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WatchPartyRoom roomId={id} />;
}
