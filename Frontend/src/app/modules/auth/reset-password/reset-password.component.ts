import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  NgForm,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { finalize } from "rxjs";
import { fuseAnimations } from "@fuse/animations";
import { FuseValidators } from "@fuse/validators";
import { FuseAlertType } from "@fuse/components/alert";
import { AuthService } from "app/core/auth/auth.service";
import { CommonFunctionsService } from "../../../utils/common-functions.service";
@Component({
  selector: "auth-reset-password",
  styleUrls: ["./reset-password.component.scss"],
  templateUrl: "./reset-password.component.html",
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class AuthResetPasswordComponent implements OnInit {
  @ViewChild("resetPasswordNgForm") resetPasswordNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };
  resetPasswordForm: UntypedFormGroup;
  showAlert: boolean = false;

  /**
   * Constructor
   */
  ref_token: string = "";
  constructor(
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
    public _utilities: CommonFunctionsService,
    private route: ActivatedRoute,
    private _router: Router
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this._utilities.callRedirectLoader();
    // Create the form
    this.resetPasswordForm = this._formBuilder.group(
      {
        password: ["", Validators.required],
        passwordConfirm: ["", Validators.required],
      },
      {
        validators: FuseValidators.mustMatch("password", "passwordConfirm"),
      }
    );
    this.route.params.subscribe((params) => {
      this.ref_token = params?.token || "";
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Reset password
   */
  resetPassword(): void {
    // Return if the form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }

    // Disable the form
    this.resetPasswordForm.disable();

    // Hide the alert
    this.showAlert = false;

    // Send the request to the server
    this._authService
      .resetPassword({
        ...this.resetPasswordForm.value,
        token: this.ref_token,
      })
      .pipe(
        finalize(() => {
          // Re-enable the form
          this.resetPasswordForm.enable();

          // Reset the form
          this.resetPasswordNgForm.resetForm();

          // Show the alert
          this.showAlert = true;
        })
      )
      .subscribe(
        (response) => {
          // Set the alert
          this.alert = {
            type: "success",
            message: "Your password has been reset. Please login now.",
          };
        },
        (response) => {
          // Set the alert
          this.alert = {
            type: "error",
            message: "Something went wrong, please try again.",
          };
        }
      );
  }
}