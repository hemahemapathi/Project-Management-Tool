import express from 'express';
import cors from 'cors';
import fileRoutes from './routes/file.js';
import userRoutes from './routes/user.js';
import projectRoutes from './routes/project.js';
import taskRoutes from './routes/task.js';
import reportRoutes from './routes/report.js';
import teamRoutes from './routes/team.js';


const app = express();

// Middleware
app.use(cors({
  origin: 'https://trek-project-management-tool.netlify.app',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/file', fileRoutes);
app.use('/api/user', userRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/task',taskRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/team',teamRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

export default app;
