import { Err, Ok, Result } from "rustic";

export function ddmmyyyToDate(dateString: string): Result<Date, Error> {
    if (!dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return Err(new Error('Invalid date format'));
    }

    const [day, month, year] = dateString.split('/');
    return Ok(new Date(+year, +month - 1, +day));
}