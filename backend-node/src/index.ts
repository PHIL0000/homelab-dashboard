import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import userSettingsRoutes from './routes/user_settings';
import infrastructureRoutes from './routes/infrastructure';
import settingsRoutes from './routes/settings';
import weatherStationRoutes from './routes/weather_station';
import dashboardRoutes from './routes/dashboard';

const app = express();
const port = 3001; // Backend on 3001

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/infrastructure', infrastructureRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/settings/weather-station', weatherStationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});