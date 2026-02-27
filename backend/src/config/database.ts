import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(` MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(' MongoDB disconnected!');
    });

  } catch (error) {
    console.error(' MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
