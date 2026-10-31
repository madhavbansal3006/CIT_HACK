import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  Info, 
  Filter 
} from 'lucide-react';
import { EventLogItem, EventCategory } from '../types/simulation';

interface EventLogPanelProps {
  events: EventLogItem[];
  onClearEvents: () => void;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({
  events,
  onClearEvents,
}) => {
  const [filter, setFilter] = useState<'all' | 'alerts' | 'actions'>('all');

  const filteredEvents = events.filter((e) => {
    if (filter === 'alerts') return e.category === 'warn' || e.category === 'danger';
    if (filter === 'actions') return e.category === 'action';
    return true;
  });

  const getCategoryIcon = (category: EventCategory) => {
    switch (category) {
      case 'normal':
        return <CheckCircle2 size={15} className="event-icon text-teal" />;
      case 'warn':
        return <AlertTriangle size={15} className="event-icon text-warning" />;
      case 'danger':
        return <ShieldAlert size={15} className="event-icon text-danger" />;
      case 'action':
        return <Zap size={15} className="event-icon text-blue" />;
      case 'info':
      default:
        return <Info size={15} className="event-icon text-muted" />;
    }
  };

  return (
    <div className="panel event-log-card">
      <div className="panel-header-row">
        <div className="panel-title-group">
          <Bell size={18} className="panel-header-icon" />
          <h2 className="panel-title">Audit Trail & Event Log</h2>
          <span className="log-count-pill">{events.length} Events</span>
        </div>

        <div className="log-header-controls">
          <div className="filter-group">
            <button 
              type="button"
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              type="button"
              className={`filter-btn ${filter === 'alerts' ? 'active' : ''}`}
              onClick={() => setFilter('alerts')}
            >
              Alerts
            </button>
            <button 
              type="button"
              className={`filter-btn ${filter === 'actions' ? 'active' : ''}`}
              onClick={() => setFilter('actions')}
            >
              Actions
            </button>
          </div>

          <button 
            type="button" 
            className="clear-log-btn"
            onClick={onClearEvents}
            title="Clear current log entries"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="log-list-wrapper">
        {filteredEvents.length === 0 ? (
          <div className="log-empty-state">
            <p>No logged events match the selected filter.</p>
          </div>
        ) : (
          <div className="log-list">
            {filteredEvents.map((item) => (
              <div key={item.id} className={`log-row log-${item.category}`}>
                <span className="log-time">{item.time}</span>
                <span className="log-icon-container">
                  {getCategoryIcon(item.category)}
                </span>
                <div className="log-content">
                  <div className="log-message">{item.message}</div>
                  {item.details && (
                    <div className="log-details">{item.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

