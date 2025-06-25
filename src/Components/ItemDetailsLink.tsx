import {ItemDetails} from "@/pages/item-check/item-check";
import {Link} from "react-router-dom";
import React, {useState} from "react";
import ItemDetailsListPopup from "@/pages/item-check/components/item-details-list-popup";

const ItemDetailsLink = ({data}: { data: ItemDetails }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openItemDetails = () => {
    setIsOpen(true);
  };

  const closeItemDetails = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Link
        className="text-blue-600 hover:underline"
        onClick={(e) => {
          e.preventDefault();
          openItemDetails();
        }}
        to="">
        {data.itemCode}
      </Link>
      <ItemDetailsListPopup
        isOpen={isOpen}
        onClose={closeItemDetails}
        details={data}
      />
    </>
  );
}

export default ItemDetailsLink;