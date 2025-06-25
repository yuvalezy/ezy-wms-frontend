import {ItemDetails} from "@/pages/item-check/item-check";
import {useItemDetailsPopup} from "@/hooks/useItemDetailsPopup";
import {Link} from "react-router-dom";
import React from "react";

const ItemDetailsLink = ({data}: { data: ItemDetails }) => {
  const {openItemDetails} = useItemDetailsPopup();
  return <Link
    className="text-blue-600 hover:underline"
    onClick={() => openItemDetails(data)}
    to={""}>{data.itemCode}</Link>
}

export default ItemDetailsLink;