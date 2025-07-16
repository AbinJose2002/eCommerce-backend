import express from 'express'
import Stripe from 'stripe'
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express()
app.use(express.json());
app.use(cors());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = 8080 || process.env.PORT

app.post('/payment-intent', async (req, res) => {
  const { formData, itemId, itemCount, totalAmount, productTitle } = req.body

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: formData.email,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: productTitle || 'Your Product',
            },
            unit_amount: Math.round((totalAmount / itemCount) * 100), 
          },
          quantity: itemCount,
        },
      ],
      success_url: 'http://localhost:3000/success', 
      cancel_url: 'http://localhost:3000/fail',
    })

    res.send({ id: session.id })
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})