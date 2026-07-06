"use client";

import { QRCodeSVG } from "qrcode.react";

type QRCodeCardProps = {
  booking: {
    id: string;
    customer_name: string;
    booking_time: string;
  };
};

export function QRCodeCard({ booking }: QRCodeCardProps) {
  const qrData = JSON.stringify({
    bookingId: booking.id,
    customer: booking.customer_name,
    time: booking.booking_time,
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-xl border border-zinc-100">
        <QRCodeSVG
          value={qrData}
          size={200}
          level="H"
          bgColor="#ffffff"
          fgColor="#18181b"
        />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-zinc-900">{booking.customer_name}</p>
        <p className="text-xs text-zinc-400">
          {new Date(booking.booking_time).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <p className="text-[10px] text-zinc-300 font-mono">{booking.id.slice(0, 8)}</p>
      </div>
    </div>
  );
}
