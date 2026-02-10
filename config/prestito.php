<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Maximum Borrowing Limit Per User
    |--------------------------------------------------------------------------
    |
    | This value defines the maximum number of items a user can borrow
    | simultaneously in the Prestito system.
    |
    */

    'max_borrow_per_user' => env('PRESTITO_MAX_BORROW_PER_USER', 2),
];
