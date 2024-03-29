<template>
    <div>
      <AdminSideBar />
      <v-data-table
        :headers="headers"
        :items="categoryList"
        :items-per-page="15"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Category</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
  
            <!-- -------------****** create dialog ******-------------------------- -->
            <v-dialog v-model="dialog" max-width="400px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  class="mb-2 widthoutupercase white--text"
                  v-bind="attrs"
                  v-on="on"
                >
                  Add Category
                </v-btn>
              </template>
              <template
                ><v-form ref="createCategoryForm" v-model="createCategoryForm">
                  <v-card>
                    <v-card-title>
                      <h3>Add New Category</h3>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col cols="12" sm="6" md="6">
                            <v-text-field
                              v-model="createDemo.categoryName"
                              :rules="[
                                (v) => !!v || 'Required',
                                (v) =>
                                  (v && v.length <= 50) ||
                                  'Title must be less than 50 characters',
                              ]"
                              label="Category Name"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
  
                      <v-btn
                        class="mb-2 widthoutupercase"
                        text
                        @click="closeCreate"
                        >Cancel
                      </v-btn>
                      <v-btn
                        color="primary"
                        class="mb-2 widthoutupercase white--text"
                        @click="save"
                        :disabled="!createCategoryForm"
                        ><span v-if="!loading">Save</span>
                        <v-progress-circular
                          v-else
                          indeterminate
                          color="primary"
                        ></v-progress-circular
                      ></v-btn>
                    </v-card-actions>
                    <v-alert class="mt-3" v-show="errorAlert" dense type="error">
                      Create Category Failed!
                    </v-alert>
                    <!-- Same Name Error Alert -->
                  </v-card>
                  <!-- Error Alert For Category -->
                </v-form></template>
                
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon color="blue" class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon color="error" @click="deleteItem(item)"> mdi-delete </v-icon>
        </template>
        <template v-slot:[`item.categoryName`]="{ item }">
          {{ item.categoryName | capitalising }}
        </template>
        <template v-slot:[`item.createdAt`]="{ item }">
          {{ item.createdAt | formatLocalDate }}
        </template>
        <template v-slot:[`item.updatedAt`]="{ item }">
          {{ item.updatedAt | formatLocalDate }}
        </template>
      </v-data-table>
      <v-toolbar>
        <!-- -------------****** update dialog ******-------------------------- -->
        <v-dialog v-model="update_dialog" max-width="400px">
          <v-card>
            <v-card-title>
              <h3>Edit Category</h3>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="updateDemo.categoryName"
                      :rules="[
                        (v) => !!v || 'Required',
                        (v) =>
                          (v && v.length <= 50) ||
                          'Title must be less than 50 characters',
                      ]"
                      label="Category Name"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="mb-2 widthoutupercase" text @click="closeUpdate"
                >Cancel</v-btn
              >
              <v-btn
                color="primary"
                class="mb-2 widthoutupercase white--text"
                @click="updateItemConfirm(updateDemo.categoryId)"
                >Update</v-btn
              >
            </v-card-actions>
            <v-alert class="mt-3" v-show="errorAlert" dense type="error">
              Update Category Failed!
            </v-alert>
          </v-card>
        </v-dialog>
        <!-- -------------****** delete ******-------------------------- -->
        <v-container>
          <v-dialog v-model="delete_dialog" max-width="400px">
            <v-card>
              <v-card-title
                ><span>Are you sure you want to delete this?</span></v-card-title
              >
  
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="widthoutupercase mb-2" text @click="closeDelete"
                  >Cancel</v-btn
                >
                <v-btn
                  color="primary"
                  class="mb-2 widthoutupercase white--text"
                  @click="deleteItemConfirm(deleteDemo.categoryId)"
                  >Delete</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </v-toolbar>
    </div>
  </template>
  
  <script>
  import swal from "sweetalert2";
  window.swal = swal;
  import utils from "@/utils/utils";
  import AdminSideBar from "@/components/AdminSidebar.vue";
  export default {
    components: {
      AdminSideBar,
    },
    filters: {
      capitalising: function (value) {
        if (!value) return '';
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
    },
    data: () => ({
      localDomain: utils.constant.localDomain,
      createCategoryForm: false,
      dialog: false,
      update_dialog: false,
      delete_dialog: false,
      loading: false,
      errorAlert: false,
      deleteDemo: {},
      updateDemo: {},
      createDemo: {
        categoryName: "",
      },
      categoryList: [],
      headers: [
        { text: "Category", value: "categoryName" },
        { text: "Created Date", value: "createdAt" },
        { text: "Modified Date", value: "updatedAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    }),
  
    async created() {
      await this.fetchAllCategories();
    },
    methods: {
      // <!-- -------------****** get all category from utils.http ******-------------------------- -->
      async fetchAllCategories() {
        const response = await utils.http.get("/category/list");
        if (response) {
          const data = await response.json();
          if (data) this.categoryList = data;
        }
      },
      // <!-- -------------****** save Category from utils.http ******-------------------------- -->
  
      async save() {
        if (this.$refs.createCategoryForm.validate()) {
          this.errorAlert = false;
  
          let CategoryNameCheckOK = false;
          const respCategoryNameCheck = await utils.http.get(
            "/category/categoryName/" + this.createDemo.categoryName.trim()
          );
          if (respCategoryNameCheck && respCategoryNameCheck.status === 200) {
            const data = await respCategoryNameCheck.json();
            if (data && data === true) {
              swal.fire({
                icon: "error",
                title: "Sorry...",
                text: "Category name already exists!",
              });
            }
            //Return false (when category is the different name)
            else {
              CategoryNameCheckOK = true;
            }
          }
          if (CategoryNameCheckOK) {
            
              // Create Category utils.http
               const resp = await utils.http.post("/admin/category/create", {
                categoryName: this.createDemo.categoryName,
                // categoryPhoto: respPosterData,
              });
              if (resp) {
                await this.fetchAllCategories();
                this.dialog = false;
                this.createDemo = {};
              }
            this.loading = false;
          }
        }
      },
      // <!-- -------------****** update table from utils.http ******-------------------------- -->
      async updateItemConfirm(id) {
        this.errorAlert = false;
        this.loading = true;
        const resp = await utils.http.put("/admin/category/update/" + id, {
          categoryName: this.updateDemo.categoryName,
        });
        if (resp && resp.status === 200) {
          this.update_dialog = false;
          await this.fetchAllCategories();
        } else {
          swal.fire({
            icon: "error",
            title: "Sorry...",
            text: "Category cannot update!",
          });
        }
  
        this.loading = false;
      },
      // <!-- -------------****** delete table from utils.http ******-------------------------- -->
      async deleteItemConfirm(id) {
        const resp = await utils.http.del("/admin/category/delete/" + id);
        if (resp.status == 200) {
          await this.fetchAllCategories();
          this.delete_dialog = false;
        }
      },
      deleteItem(item) {
        this.delete_dialog = true;
        this.deleteDemo = item;
      },
      editItem(item) {
        this.update_dialog = true;
        // Copy Object
        this.updateDemo = Object.assign({}, item);
        this.categoryName = this.updateDemo.categoryName;
      },
      closeUpdate() {
        this.update_dialog = false;
      },
      closeDelete() {
        this.delete_dialog = false;
      },
      closeCreate() {
        this.dialog = false;
      },
      saveCancel() {
        this.dialog = false;
        this.createDemo = {};
      },
    },
  };
  </script>
  
  <style>
  .v-btn:hover {
    background-color: primary;
    color: white !important;
  }
  </style>
  