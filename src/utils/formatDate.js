export const formatDate = (date) => {
  if (!date) return '';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('es-ES', options);
};

export const formatShortDate = (date) => {
  if (!date) return '';
  
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('es-ES', options);
};

export const formatTime = (date) => {
  if (!date) return '';
  
  const options = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleTimeString('es-ES', options);
};
