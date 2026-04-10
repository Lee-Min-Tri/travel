import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import tourRoute from './routes/tours.js'
import userRoute from './routes/user.js'
import authRoute from './routes/auth.js'
import reviewRoute from './routes/review.js'
import bookingRoute from './routes/booking.js'



dotenv.config()
const app = express()
const port = process.env.PORT || 8000
const corsOption ={
    origin:true,
    credentials:true
}

//testing database
const connect = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)

        console.log('yes')
    } catch (err) {
        console.log('No',err.message)
    }
}

app.use(express.json())
app.use(cors(corsOption))
app.use(cookieParser())
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/tours', tourRoute)
app.use('/api/v1/users', userRoute)
app.use('/api/v1/review', reviewRoute)
app.use('/api/v1/booking', bookingRoute)


app.listen(port, () =>{
    connect()
    console.log(`Server Started on http://localhost:${port}`)
})