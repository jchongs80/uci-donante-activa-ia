import { Card, CardContent, Stack, Typography } from "@mui/material";

export default function StatCard(props: {
  title: string;
  value: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <div>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {props.title}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {props.value}
            </Typography>
            {props.subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {props.subtitle}
              </Typography>
            )}
          </div>
          {props.right}
        </Stack>
      </CardContent>
    </Card>
  );
}