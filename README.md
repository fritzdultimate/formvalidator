# formvalidator
<br><br>

## Table Of Contents
-----------

* .[What Is Formvalidator].(#what-is-fv)
* .[Initialization].(#initialization)
* .[Creating Rules].(#creatin-rules)
* .[Listing Errors].(#listing-errors)
* .[What Next].(#what-next)
* .[Contributing].(#contributing)

<a name="what-is-fv"></a>

## What Is Formvalidator

**Formvalidator** or **Form Validator** is a _Light weight_ **Javascript library**, which aims at making front-end validation as simple as possible and a bliss. <br>
Making form validation simple does not mean making the validation weak, **NO**, instead it tends to reduce the amount or boring codes one will write to validate multiple for in a single project.
<br><br>

Take for instance, in a project that requires different types of form validation in twenty different place, and each place requires not less than **100 lines of code**, do the maths. You will actually end up writing not less than **2000 lines of codes**. These are one of the simple reasons **formvalidator** comes *_handy_*.

The interesting part is that new **rules** can be added to the library so easily.


<a name="initialization"></a>

## Initialization

The library is created with **ECM6 class**, so the first thing we need to do is to first of all, initialize it, by creating a new instance of the _class_.  When initialized, the **constructor** function expects a parameter, which must be one of three options.

* HTML form (which must be instance of **HTMLFormElement**)
* FormData (which must be instance of **FormData**)
* Array of HTML input (which must be instance of **HTMLInputElement**)

---------------

#### Example:

```html
    <form id="form">
        <input name="user" value="username">
        <input name="pass" value="password">
        <input name="age" value="21">
    </form>
```

```javascript
    let ref = document.getElementById('form');
    let vldtr = new Validator(ref)

    // OR

    let form = new FormData();
    form.append('user', 'username')
    form.append('pass', 'password')
    form.append('age', '21')

    let vldtr = new Validator(form)
```

**Note:** 
* Please it should be clear that the two above codes are the same. (the **HTML form** and the **FormData**)
* the above code snippet will be used as a reference to the rest of the examples below.


<a name="creatin-rules"></a>

## Creating Rules

This is an **important** section, because this is where our logic depends, our form will be validated based on anything we provided to our rules. It should be well noted that at the point of writing this **_DOCS_**, there are limited rules, but just like I said before, adding rules is as simple as _ABC_. 

The rules object will be passed to the method `validate(rules)`

Rules is an `Object` where it keys are the named input e.g **pass** as above, the keys must a named input or the key of `FormData`. I will show you example later. each rule object must also have a key `rules` with an optional key `errors`:

* ### rules

the value of the key `rules` is the list of the supported rules which the library will use to validate your form.
e.g `rules: 'required|min_length[6]'`

as you can see, the value is a string seperated by the pipe sign `|`, an attention should be paid to `min_length[6]`, that is how we pass parameter the method `minLength` which is called. also notice that our class method for `min_length` is `minLength`.

* ### errors

**\*OPTIONAL\***
the value of `errors` is an `Object`, where each key is the rule, and the value of the keys is the error message to show to user incase the validation fails.

--------------------

#### Example Below:

**Note:** _we will be using the already initialized `class` as reference_

```javascript
    let rules = {
        pass: {
            rules: 'required|min_length[6]',
            errors: {
                required: 'password can not be missing!',
                min_length: 'password must be greater than 5 chars'
            }
        },

        user: {
            rules: 'required|min_length[3]',
        }
    }

    // call the method 'validate' to validate the form

    let val = vldtr.validate(rules);
```

If you take a close look at the above codes, you will notice two things:
* Validation for **age** field is missing and hence won't be validated.
* `errors` key is missing for the **user** field, hence the default error messages will be used.

--------------

<a name="#listing-errors"></a>

## Listing Errors

Incase we encounter an error during validation, meaning the form didn't validate successfully. the `class` property `errors` will be populated with the resulting errors.

For example, assuming the `password` field wasn't filled, the below error will be available:

```javascript
    console.log(vldtr.errors)

    /**
     * in the browser console ...
     * {pass: 'password can not be missing!'}
    */
```

<a name="what-next"></a>

## What Next

#WIP

The library is not yet ready to be used on production projects, as it's still been getting updates and still developing.

Our aim is to provide for use as much as many validation rules to be used by front-end engineers to minize the amount of codes to write when validating a form and hence focus more on the main logic of your project.

------------------

Please give us your **one star** :star:

---------------


<a name="contributing"></a>

## Contributing

Your contribution is highly appreciated, fork and start making the project a better one.
