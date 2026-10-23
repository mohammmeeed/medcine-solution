import React from "react";
import {Link} from 'react-router-dom';

const PageTitle = ({ motherMenu, activeMenu }) => {
   return (     
      <div className="row page-titles">         
         <ol className="breadcrumb ps-0 mb-0">
            <li className="breadcrumb-item">
               <Link to={"#"}>{motherMenu}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
               {activeMenu}
            </li>
         </ol>
      </div>
   );
};

export default PageTitle;
