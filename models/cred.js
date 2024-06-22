import mongoose from 'mongoose';
// Database handling
main().catch(err => console.log(err));

async function main() {//this is for promise handling
  await mongoose.connect('mongodb://localhost:27017/credential');
  console.log("Database connected");
}

const credSchema=new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique:true,   //inorder to avoid duplicate 
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});

const Cred=mongoose.model('Cred',credSchema);
export  default Cred;