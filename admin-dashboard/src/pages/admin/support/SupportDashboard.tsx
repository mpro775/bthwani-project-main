/**
 * Support Dashboard
 */

import { Box, Grid, Card, CardContent, Typography, Chip, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { useSupportTickets, useSupportStats } from '@/api/support';

export default function SupportDashboard() {
  const { data: ticketsData, loading: ticketsLoading } = useSupportTickets();
  const { data: statsData } = useSupportStats();

  if (ticketsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const tickets = ticketsData?.data || [];
  const stats = statsData?.data;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        الدعم الفني
      </Typography>

      {/* Stats */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">إجمالي التذاكر</Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">مفتوحة</Typography>
                <Typography variant="h4" color="error">{stats.open}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">قيد المعالجة</Typography>
                <Typography variant="h4" color="warning.main">{stats.inProgress}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid  size={{xs: 12, sm: 6, md: 3}}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">محلولة</Typography>
                <Typography variant="h4" color="success.main">{stats.resolved}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tickets List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            التذاكر الحديثة
          </Typography>
          <List>
            {tickets.slice(0, 10).map((ticket) => (
              <ListItem key={ticket.id} divider>
                <ListItemText
                  primary={ticket.subject}
                  secondary={`${ticket.category} - ${new Date(ticket.createdAt).toLocaleDateString('ar-SA')}`}
                />
                <Chip
                  label={ticket.status}
                  color={
                    ticket.status === 'open' ? 'error' :
                    ticket.status === 'in_progress' ? 'warning' :
                    ticket.status === 'resolved' ? 'success' : 'default'
                  }
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

