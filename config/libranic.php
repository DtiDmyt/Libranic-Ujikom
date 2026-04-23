<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Maximum Borrowing Limit Per User
    |--------------------------------------------------------------------------
    |
    | This value defines the maximum number of items a user can borrow
    | simultaneously in the Libranic system.
    |
    */

    'max_borrow_per_user' => env('LIBRANIC_MAX_BORROW_PER_USER', 2),
];
