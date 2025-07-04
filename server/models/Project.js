import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Project description cannot exceed 1000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['Not Started', 'In-Progress', 'Completed'],
      message: 'Status must be one of: Not Started, In-Progress, Completed'
    },
    default: 'Not Started'
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Priority must be one of: Low, Medium, High'
    },
    default: 'Medium'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project manager is required']
  },
  team_members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative'],
    default: 0
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating days remaining
projectSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const endDate = new Date(this.endDate);
  const timeDiff = endDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
});

// Virtual for checking if project is overdue
projectSchema.virtual('isOverdue').get(function() {
  const today = new Date();
  const endDate = new Date(this.endDate);
  return today > endDate && this.status !== 'Completed';
});

// Virtual for project duration in days
projectSchema.virtual('duration').get(function() {
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
});

// Index for better query performance
projectSchema.index({ manager: 1, createdAt: -1 });
projectSchema.index({ team_members: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });

// Pre-save middleware to update progress based on status
projectSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    switch (this.status) {
      case 'Not Started':
        this.progress = 0;
        break;
      case 'In-Progress':
        if (this.progress === 0) {
          this.progress = 25;
        }
        break;
      case 'Completed':
        this.progress = 100;
        break;
    }
  }
  next();
});

// Static method to get projects by status
projectSchema.statics.getByStatus = function(status) {
  return this.find({ status })
    .populate('manager', 'name email')
    .populate('team_members', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get overdue projects
projectSchema.statics.getOverdue = function() {
  const today = new Date();
  return this.find({
    endDate: { $lt: today },
    status: { $ne: 'Completed' }
  })
    .populate('manager', 'name email')
    .populate('team_members', 'name email')
    .sort({ endDate: 1 });
};

// Instance method to add team member
projectSchema.methods.addTeamMember = function(userId) {
  if (!this.team_members.includes(userId)) {
    this.team_members.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  this.team_members = this.team_members.filter(
    member => member.toString() !== userId.toString()
  );
  return this.save();
};

const Project = mongoose.model('Project', projectSchema);

export default Project;
