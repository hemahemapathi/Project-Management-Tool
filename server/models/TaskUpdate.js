import mongoose from 'mongoose';

const TaskUpdateSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  fileUpload: {
    type: String,
    required: false
  }
});

const TaskUpdate = mongoose.model('TaskUpdate', TaskUpdateSchema);

export default TaskUpdate;