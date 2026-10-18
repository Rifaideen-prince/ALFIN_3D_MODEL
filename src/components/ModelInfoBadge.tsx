import React from 'react';
import { ModelStats } from '../types/viewer';
import { formatCompactNumber, truncateFilename } from '../utils/formatters';

interface ModelInfoBadgeProps {
  stats: ModelStats | null;
  isLoading: boolean;
  loadingMessage?: string;
}

export const ModelInfoBadge: React.FC<ModelInfoBadgeProps> = ({ stats, isLoading, loadingMessage }) => {
  if (!stats && !isLoading) return null;

  return (
    <div className="floating-model-badge" id="viewport-model-badge">
      <div
        className="status-indicator-dot"
        style={{
          backgroundColor: isLoading ? '#FFB020' : '#00E58B',
          boxShadow: isLoading ? '0 0 8px #FFB020' : '0 0 8px #00E58B'
        }}
      />
      
      {isLoading ? (
        <span>{loadingMessage || 'PARSING 3D GEOMETRY...'}</span>
      ) : stats ? (
        <>
          <span title={stats.filename} style={{ fontWeight: 600 }}>
            {truncateFilename(stats.filename, 28)}
          </span>
          <span className="badge-tris">
            {formatCompactNumber(stats.trianglesCount)} TRIS
          </span>
          {stats.fileExtension && (
            <span className="badge-format">{stats.fileExtension.replace('.', '')}</span>
          )}
        </>
      ) : null}
    </div>
  );
};
