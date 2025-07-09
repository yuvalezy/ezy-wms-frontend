import {Link} from "react-router-dom";
import React, {useState} from "react";
import ItemDetailsListPopup from "@/features/items/components/ItemDetailsListPopup";
import {ItemDetails} from "@/features/items/data/items";

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