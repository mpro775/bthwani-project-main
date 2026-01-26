import React from 'react';
import { Box, Typography, Button, type SvgIconTypeMap, type SvgIconProps } from '@mui/material';
import  type{ OverridableComponent } from '@mui/material/OverridableComponent';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: OverridableComponent<SvgIconTypeMap<object, "svg">>;
  Icon?: React.ComponentType<SvgIconProps>; // Updated this line
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: IconComponent,
  Icon: CustomIcon
}) => {
  const renderIcon = () => {
    if (CustomIcon) {
      return <CustomIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />;
    }
    if (IconComponent) {
      return <IconComponent sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />;
    }
    return null;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="300px"
      textAlign="center"
      p={3}
    >
      {renderIcon()}
      <Typography variant="h5" gutterBottom color="text.secondary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ minWidth: 150 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
