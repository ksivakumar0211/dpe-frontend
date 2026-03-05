import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MenuState {
  items: any[];
}

const initialState: MenuState = {
  items: [],
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenu: (state, action: PayloadAction<any>) => {
      console.log('actionactionactionaction', action)
      const dashboardItem = {
        menuNameTree: "Dashboard",
        menuLinkName: "/dashboard",
      };
      const items = [
        {
          menuNameTree: "Dashboard",
          menuLinkName: "/dashboard"
        },
        {
          menuNameTree: "Security",
          menuLinkName: "/security",
          children: [
            {
              menuNameTree: "Transaction",
              menuLinkName: "/security/transaction",
              children: [
                {
                  menuNameTree: "User Access",
                  menuLinkName: "/security/transaction/user-access",
                  children: [
                    { menuNameTree: "Add", menuLinkName: "/addUserAccess" },
                    { menuNameTree: "Edit", menuLinkName: "/editUserAccess" }
                  ]
                }
              ]
            }
          ]
        },
        // {
        //   menuNameTree: "Agent",
        //   menuLinkName: "/security",
        //   children: [
        //     {
        //       menuNameTree: "Application",
        //       menuLinkName: "/security/transaction",
        //       children: [
        //         {
        //           menuNameTree: "Ducument Upload",
        //           menuLinkName: "/security/transaction/user-access",
        //           children: [
        //             { menuNameTree: "View", menuLinkName: "/security/transaction/user-access/add" },
        //             { menuNameTree: "Edit", menuLinkName: "/security/transaction/user-access/edit" }
        //           ]
        //         }
        //       ]
        //     }
        //   ]
        // },

        {
          menuNameTree: "Container Operation",
          menuLinkName: "/security",
          children: [
            {
              menuNameTree: "Transaction",
              menuLinkName: "/security/transaction",
              children: [
                {
                  menuNameTree: "Gain In - Container",
                  menuLinkName: "/security/transaction/user-access",
                  children: [
                    { menuNameTree: "Add", menuLinkName: "/addGateIn" },
                    { menuNameTree: "Edit", menuLinkName: "/editGateIn" }
                  ]
                },
                {
                  menuNameTree: "Direct Port Entry Service Charges",
                  menuLinkName: "/security/transaction/user-access",
                  children: [
                    { menuNameTree: "Add", menuLinkName: "/addDpeServiceCharge" },
                    { menuNameTree: "Edit", menuLinkName: "/editDpeServiceCharge" }
                  ]
                },
                {
                  menuNameTree: "Document Upload",
                  menuLinkName: "/security/transaction/user-access",
                  children: [
                    { menuNameTree: "View", menuLinkName: "/viewDocUpload" },
                  ]
                },
                {
                  menuNameTree: "Gain Out - Container",
                  menuLinkName: "/security/transaction/user-access",
                  children: [
                    { menuNameTree: "Add", menuLinkName: "/addGateOut" },
                    { menuNameTree: "Edit", menuLinkName: "/editGateOut" }
                  ]
                }

              ]
            }
          ]
        },

      ]
      const itemss: any = action; 
      return {
        items: [dashboardItem, ...(itemss?.payload || [])],
      };

    },
    clearMenu: (state) => {
      state.items = [];
    },
  },
});

export const { setMenu, clearMenu } = menuSlice.actions;
export default menuSlice.reducer;
