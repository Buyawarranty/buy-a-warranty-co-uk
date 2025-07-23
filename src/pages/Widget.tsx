import { VehicleWidget } from '@/components/VehicleWidget';

export default function Widget() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <VehicleWidget 
        redirectUrl={window.location.origin}
        className="bg-white"
      />
    </div>
  );
}