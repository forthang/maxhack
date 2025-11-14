import React from 'react';

interface EventCardProps {
  start: Date;
  end: Date;
  title: string;
  description: string;
  auditorium?: string | null;
  signedUp: boolean;
  isTogglingSignup?: boolean;
  onDetails: () => void;
  onUnsubscribe?: () => void;
  onSignup?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
}) => {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
};

export default EventCard;