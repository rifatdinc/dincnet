import { HttpTypes } from '@medusajs/types';

import { OrderAddresses } from "@/components/organisms/OrderAddresses/OrderAddresses"
import { OrderParcels } from "@/components/organisms/OrderParcels/OrderParcels"
import { OrderTotals } from "@/components/organisms/OrderTotals/OrderTotals"

export const OrderDetailsSection = ({ order }: { order: HttpTypes.StoreOrder }) => {
  return (
    <div>
      <OrderParcels orders={[order]} />
      <OrderTotals order={order} />
      {/* <OrderAddresses /> */}
    </div>
  )
}
