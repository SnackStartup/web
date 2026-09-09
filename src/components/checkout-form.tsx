import {
  ExpressCheckoutElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout'
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js'

const CheckoutForm = () => {
  const checkoutState = useCheckoutElements()

  const handleExpressCheckoutConfirm = (
    event: StripeExpressCheckoutElementConfirmEvent,
  ) => {
    if (checkoutState.type !== 'success') {
      event.paymentFailed({
        reason: 'fail',
        message: 'Checkout nie jest jeszcze gotowy.',
      })
      return
    }
    return checkoutState.checkout.confirm({
      expressCheckoutConfirmEvent: event,
    })
  }

  return (
    <ExpressCheckoutElement
      onConfirm={handleExpressCheckoutConfirm}
      options={{
        paymentMethods: { googlePay: 'always' },
        buttonHeight: undefined,
        buttonTheme: undefined,
        buttonType: undefined,
        layout: undefined,
        paymentMethodOrder: undefined,
      }}
    />
  )
}

export default CheckoutForm
